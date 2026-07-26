# Deploying FoodShare to Amazon EC2

This guide deploys the Node/Express API and the built React app on a single
EC2 instance behind Nginx, with all data in DynamoDB/S3/SNS/CloudWatch.

## 1. Launch the EC2 instance
- AMI: Ubuntu Server 22.04 LTS
- Instance type: t2.micro / t3.micro (Free Tier eligible)
- Security Group inbound rules:
  - 22 (SSH) — your IP only
  - 80 (HTTP) — 0.0.0.0/0
  - 443 (HTTPS) — 0.0.0.0/0 (if using SSL)
- **IAM Role**: attach a role with the permissions in `backend/aws/iam-policy.json`
  (DynamoDB, S3, SNS, CloudWatch Logs). This lets the app authenticate to AWS
  without hardcoding access keys.
- **Elastic IP (EIP) Best Practice**: Allocate an AWS Elastic IP via AWS VPC Console / AWS CLI and associate it with the EC2 instance. Standard public IPs on non-EIP EC2 instances change dynamically on instance stop/restart. Attaching an Elastic IP preserves a fixed public IP across all reboots.

```bash
# Allocate and associate an AWS Elastic IP via AWS CLI:
ALLOCATION_ID=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
aws ec2 associate-address --instance-id <YOUR_EC2_INSTANCE_ID> --allocation-id $ALLOCATION_ID
```


## 2. Create AWS resources (from your local machine or CloudShell)
```bash
# DynamoDB tables (Users + Donations with GSIs)
cd backend
npm install
node scripts/createTables.js

# S3 bucket for food images
aws s3api create-bucket --bucket foodshare-food-images --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1
aws s3api put-bucket-cors --bucket foodshare-food-images --cors-configuration file://aws/s3-cors.json

# SNS topic for notifications
aws sns create-topic --name FoodShareNotifications
# subscribe an email endpoint (optional):
aws sns subscribe --topic-arn <TOPIC_ARN> --protocol email --notification-endpoint you@example.com

# CloudWatch log group (also auto-created on first app run)
aws logs create-log-group --log-group-name /foodshare/backend
```

## 3. SSH into the instance and install dependencies
```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>

sudo apt update && sudo apt install -y nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 4. Deploy the backend
```bash
sudo mkdir -p /var/www/foodshare
sudo chown -R $USER:$USER /var/www/foodshare
# copy or git-clone the project into /var/www/foodshare
cd /var/www/foodshare/backend
npm install --production
cp .env.example .env
nano .env   # set JWT_SECRET, AWS_REGION, table names, bucket, SNS ARN, CLIENT_ORIGIN

# seed the first admin account
node scripts/createAdmin.js "Platform Admin" admin@foodshare.org "ChangeMe123!"

pm2 start ecosystem.config.js
pm2 save
pm2 startup   # follow the printed instructions to enable on boot
```

## 5. Build and deploy the frontend
```bash
cd /var/www/foodshare/frontend
npm install
cp .env.example .env
nano .env   # set VITE_API_BASE_URL=http://<EC2_PUBLIC_IP>/api  (or your domain)
npm run build   # outputs to /var/www/foodshare/frontend/dist
```

## 6. Configure Nginx
```bash
sudo cp /var/www/foodshare/deployment/nginx.conf /etc/nginx/sites-available/foodshare
sudo ln -s /etc/nginx/sites-available/foodshare /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

## 7. Verify
- Visit `http://<EC2_PUBLIC_IP>/` — the FoodShare landing page should load.
- `http://<EC2_PUBLIC_IP>/api/health` should return `{"success": true, ...}`.
- Register a donor and an NGO account, post a donation with an image, and
  confirm the image appears in the S3 bucket and the item appears in the
  DynamoDB `FoodShare_Donations` table.
- Check `CloudWatch > Log groups > /foodshare/backend` for request logs.

## 8. Optional: HTTPS
Use Certbot with a domain name pointed at the instance:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```
