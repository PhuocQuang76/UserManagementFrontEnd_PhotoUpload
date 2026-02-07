pipeline {
    agent any

    environment {
        APP_NAME = 'user-management'
        EC2_IP = '54.147.241.87'
        REPO_URL = 'https://github.com/PhuocQuang76/UserManagementFrontEnd_PhotoUpload.git'
        SSH_USER = 'ubuntu'
        WEB_DIR = '/var/www/angular-app'
        JENKINS_KEY = '/var/lib/jenkins/userkey.pem'
    }

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['production', 'staging', 'dev'],
            description: 'Deployment environment'
        )
    }

    stages {
        stage('Setup Node.js') {
            steps {
                sh '''
                    echo "=== Installing Node.js ==="
                    # Check if Node.js is installed
                    if ! command -v node &> /dev/null; then
                        echo "Node.js not found, installing..."
                        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                        sudo apt-get install -y nodejs
                    else
                        echo "Node.js already installed: $(node -v)"
                    fi

                    # Verify installation
                    node -v
                    npm -v
                '''
            }
        }

        stage('Checkout Code') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        credentialsId: 'gitCredential',
                        url: env.REPO_URL
                    ]]
                ])
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh '''
                    npx ng build --configuration=production

                    # Find the built files
                    if [ -d "dist/user-management/browser" ]; then
                        DIST_FOLDER="dist/user-management/browser"
                    else
                        DIST_FOLDER="dist/user-management"
                    fi

                    echo "Using: $DIST_FOLDER"
                    ls -la "$DIST_FOLDER"
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo "=== DEPLOY STAGE STARTED ==="
                echo "Environment: ${params.ENVIRONMENT}"
                echo "Target: ${env.SSH_USER}@${env.EC2_IP}"

                sshagent(['ec2-ssh-key']) {
                    sh '''
                        echo "=== Step 1: Finding dist folder ==="
                        if [ -d "dist/user-management/browser" ]; then
                            DIST_FOLDER="dist/user-management/browser"
                        else
                            DIST_FOLDER="dist/user-management"
                        fi
                        echo "Using: $DIST_FOLDER"
                        ls -la "$DIST_FOLDER"

                        echo "=== Step 2: Creating tar ==="
                        tar -czf dist.tar.gz -C "$DIST_FOLDER" .

                        echo "=== Step 3: Testing SSH connection ==="
                        ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SSH_USER}@${EC2_IP} "echo 'SSH OK'"

                        echo "=== Step 4: Copying file ==="
                        scp -o StrictHostKeyChecking=no dist.tar.gz ${SSH_USER}@${EC2_IP}:/tmp/

                        echo "=== Step 5: Verifying copy ==="
                        ssh -o StrictHostKeyChecking=no ${SSH_USER}@${EC2_IP} "ls -la /tmp/dist.tar.gz"

                        echo "=== Step 6: Deploying ==="
                        ssh -o StrictHostKeyChecking=no ${SSH_USER}@${EC2_IP} "
                            sudo mkdir -p ${WEB_DIR}
                            sudo rm -rf ${WEB_DIR}/*
                            sudo tar -xzf /tmp/dist.tar.gz -C ${WEB_DIR}
                            sudo chown -R www-data:www-data ${WEB_DIR}
                            rm -f /tmp/dist.tar.gz
                            sudo systemctl reload nginx
                        "

                        echo "=== Step 7: Verifying deployment ==="
                        ssh -o StrictHostKeyChecking=no ${SSH_USER}@${EC2_IP} "ls -la ${WEB_DIR}/"

                        echo "=== DEPLOY COMPLETE ==="
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployed successfully!"
            echo "🌐 App available at: http://${env.EC2_IP}/"
            echo "🌍 Environment: ${params.ENVIRONMENT}"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
        always {
            cleanWs()
        }
    }
}