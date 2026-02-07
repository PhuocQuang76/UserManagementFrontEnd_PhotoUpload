pipeline {
    agent {
        docker {
            image 'node:20-alpine'
            args '--user root'
        }
    }

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
                    ssh -i ${JENKINS_KEY} -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SSH_USER}@${EC2_IP} "echo 'SSH OK'"

                    echo "=== Step 4: Copying file ==="
                    scp -i ${JENKINS_KEY} -o StrictHostKeyChecking=no dist.tar.gz ${SSH_USER}@${EC2_IP}:/tmp/

                    echo "=== Step 5: Verifying copy ==="
                    ssh -i ${JENKINS_KEY} -o StrictHostKeyChecking=no ${SSH_USER}@${EC2_IP} "ls -la /tmp/dist.tar.gz"

                    echo "=== Step 6: Deploying ==="
                    ssh -i ${JENKINS_KEY} -o StrictHostKeyChecking=no ${SSH_USER}@${EC2_IP} "
                        mkdir -p ${WEB_DIR}
                        rm -rf ${WEB_DIR}/*
                        tar -xzf /tmp/dist.tar.gz -C ${WEB_DIR}
                        rm -f /tmp/dist.tar.gz
                        systemctl --user reload nginx 2>/dev/null || echo 'Nginx reload skipped (no user systemctl)'
                    "

                    echo "=== Step 7: Verifying deployment ==="
                    ssh -i ${JENKINS_KEY} -o StrictHostKeyChecking=no ${SSH_USER}@${EC2_IP} "ls -la ${WEB_DIR}/"

                    echo "=== DEPLOY COMPLETE ==="
                '''
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