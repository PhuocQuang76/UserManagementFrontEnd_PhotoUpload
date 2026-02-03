pipeline {
    agent any

    environment {
        EC2_IP = '54.92.213.227'
        REPO_URL = 'https://github.com/PhuocQuang76/UserManagementFrontEnd_PhotoUpload.git'
        SSH_KEY = '/var/lib/jenkins/userkey.pem'
        SSH_USER = 'ubuntu'
        SSH_OPTS = '-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'
        APP_DIR = '/home/ubuntu/user-management-frontEnd'
    }

    stages {
        stage('Checkout Code') {
            steps {
                // This checks out the code on the Jenkins server
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    extensions: [],
                    userRemoteConfigs: [[
                        credentialsId: 'git_credetial',
                        url: env.REPO_URL
                    ]]
                ])
            }
        }

        stage('Prepare EC2 Workspace') {
            steps {
                script {
                    sh """
                        ssh ${SSH_OPTS} -i ${SSH_KEY} ${SSH_USER}@${EC2_IP} "
                            echo 'Cleaning up previous build...'
                            rm -rf ${APP_DIR}
                            mkdir -p ${APP_DIR}
                        "
                    """
                }
            }
        }

        stage('Copy Code to EC2') {
            steps {
                script {
                    // Use rsync for efficient file transfer
                    sh """
                        rsync -avz -e "ssh -i ${SSH_KEY} ${SSH_OPTS}" \
                            --exclude='.git' \
                            --exclude='node_modules' \
                            ./ ${SSH_USER}@${EC2_IP}:${APP_DIR}/
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh """
                        ssh ${SSH_OPTS} -i ${SSH_KEY} ${SSH_USER}@${EC2_IP} "
                            echo 'Installing dependencies...'
                            cd ${APP_DIR}
                            npm install
                        "
                    """
                }
            }
        }

        stage('Build and Start') {
            steps {
                script {
                    sh """
                        ssh ${SSH_OPTS} -i ${SSH_KEY} ${SSH_USER}@${EC2_IP} "
                            echo 'Stopping any running instances...'
                            pkill -f 'ng serve' || echo 'No running instances found'

                            echo 'Building application...'
                            cd ${APP_DIR}
                            ng build --configuration=production

                            echo 'Starting application...'
                            nohup ng serve --host 0.0.0.0 --port 4200 > /home/ubuntu/frontend.log 2>&1 &
                            echo \$! > /home/ubuntu/frontend.pid

                            echo 'Application started with PID: \$(cat /home/ubuntu/frontend.pid)'
                            echo 'Application logs: /home/ubuntu/frontend.log'
                        "
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment completed successfully!'
            echo "Application is running on: http://${EC2_IP}:4200"
            // You can add notification here (Slack, email, etc.)
        }
        failure {
            echo 'Deployment failed. Checking logs...'
            sh """
                ssh ${SSH_OPTS} -i ${SSH_KEY} ${SSH_USER}@${EC2_IP} "tail -n 50 /home/ubuntu/frontend.log" || echo "Could not retrieve logs"
            """
        }
    }
}