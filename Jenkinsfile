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



        stage('Run App') {
            steps {
                sh """
                    ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ${SSH_USER}@${EC2_IP} "
                        cd ${APP_DIR}
                        nohup ng serve --host 0.0.0.0 --port 4200 > /dev/null 2>&1 &
                    "
                """
            }
        }
    }
    post {
        success {
            echo "App should be running at: http://${EC2_IP}:4200"
        }
    }
}