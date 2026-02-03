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
                    sh """
                        rsync -avz -e "ssh -i ${SSH_KEY} ${SSH_OPTS}" \
                            --exclude='.git' \
                            --exclude='node_modules' \
                            ./ ${SSH_USER}@${EC2_IP}:${APP_DIR}/
                    """
                }
            }
        }

       stage('Deploy and Start') {
                   steps {
                       script {
                           // Create a deployment script
                           def deployScript = """#!/bin/bash
                               set -e
                               cd ${APP_DIR}

                               echo "=== Stopping any running instances ==="
                               pkill -f "ng serve" || true

                               echo "=== Installing dependencies ==="
                               npm install

                               echo "=== Starting Angular app ==="
                               export NODE_OPTIONS=--openssl-legacy-provider
                               nohup ng serve --host 0.0.0.0 --port 4200 > ${APP_DIR}/app.log 2>&1 &

                               # Wait and check if app started
                               sleep 10
                               if ! pgrep -f "ng serve" > /dev/null; then
                                   echo "=== ERROR: Failed to start Angular app ==="
                                   cat ${APP_DIR}/app.log
                                   exit 1
                               fi

                               echo "=== Angular app started successfully ==="
                               exit 0
                           """

                           // Write and execute the script
                           writeFile file: 'deploy.sh', text: deployScript
                           sh """
                               scp ${SSH_OPTS} -i ${SSH_KEY} deploy.sh ${SSH_USER}@${EC2_IP}:/tmp/
                               ssh ${SSH_OPTS} -i ${SSH_KEY} ${SSH_USER}@${EC2_IP} "
                                   chmod +x /tmp/deploy.sh
                                   /tmp/deploy.sh
                               "
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