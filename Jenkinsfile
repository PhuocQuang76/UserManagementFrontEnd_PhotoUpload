pipeline {
    agent any

    environment {
        EC2_IP = '35.172.118.6'
        REPO_URL = 'https://github.com/PhuocQuang76/UserManagementFrontEnd_PhotoUpload.git'
        SSH_KEY = '/var/lib/jenkins/userkey.pem'
        SSH_USER = 'ubuntu'
        SSH_OPTS = '-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'
        APP_DIR = '/home/ubuntu/user-management-frontEnd'
        APP_JAR = 'app.jar'  // Added missing variable
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/main']],
                    extensions: [],
                    userRemoteConfigs: [[
                        credentialsId: 'gitCredential',
                        url: 'https://github.com/PhuocQuang76/UserManagementFrontEnd_PhotoUpload.git'
                    ]]
                )
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
                    sh """
                        rsync -avz -e "ssh -i ${SSH_KEY} ${SSH_OPTS}" \
                            --exclude='.git' \
                            --exclude='node_modules' \
                            ./ ${SSH_USER}@${EC2_IP}:${APP_DIR}/
                    """
                }
            }
        }

        stage('Start Application') {
            steps {
                script {
                    sh """
                        # Kill existing process if running
                        ssh -i ${SSH_KEY} ${SSH_USER}@${EC2_IP} "pkill -f ${APP_JAR} || echo 'No process to kill'"

                        # Start the application
                        ssh -i ${SSH_KEY} ${SSH_USER}@${EC2_IP} '
                            cd /home/ubuntu
                            nohup java -jar '${APP_JAR}' > app.log 2>&1 &
                            echo \\$! > app.pid
                        '

                        # Wait and verify
                        sleep 5
                        ssh -i ${SSH_KEY} ${SSH_USER}@${EC2_IP} "pgrep -f ${APP_JAR} || { echo 'App failed to start'; exit 1; }"
                    """
                }
            }
        }
    }

    post {
        always {
            echo "=== Checking app status ==="
            sh """
                ssh ${SSH_OPTS} -i ${SSH_KEY} ${SSH_USER}@${EC2_IP} "
                    echo '=== Running processes: ==='
                    ps aux | grep 'ng serve' || true
                    echo '=== App logs (last 50 lines): ==='
                    test -f ${APP_DIR}/app.log && tail -n 50 ${APP_DIR}/app.log || echo 'No log file found'
                "
            """
        }
        success {
            echo "App should be running at: http://${EC2_IP}:4200"
        }
        failure {
            echo "Deployment failed. Check the logs above for details."
        }
    }
}