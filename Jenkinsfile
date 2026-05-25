pipeline {
    agent {
        label 'wsl-node'
    }
    
    environment {
        // Define any environment variables here
        // Githib
        GITHUB_ORG = 'SUT-Capstone-G09'
        GITHUB_REPO = 'asset-sut-system'
        BRANCH_NAME = 'ci-cd'

        // Docker
        DOCKER_USERNAME = 'worawut2547'
        DOCKER_REPO = 'asset-sut-system'
        FE_IMAGE = 'g02-frontend'
        BE_IMAGE = 'g02-backend'
        IMAGE_TAG = "v${env.BUILD_NUMBER}" // Tag images with the build number

        FE_CONTAINER = 'g02-frontend-container'
        BE_CONTAINER = 'g02-backend-container'

        // Path
        FRONTEND_PATH = 'apps/frontend' // Path to your frontend code
        BACKEND_PATH = 'apps/backend' // Path to your backend code
        ANSIBLE_PATH = 'infra/ansible' // Path to your Ansible playbooks

        // Ansible
        DO_SERVER_HOST = '157.230.35.178' // Replace with your DigitalOcean server IP
        SSH_USER = 'admin' // Replace with your SSH username
        SSH_PVT_KEY_PATH = credentials('do-ssh-pvt-key-asset-sut-system-path') // Replace with the path to your SSH private key
    }

    stages {
        // ==================== Stage: Info ====================
        stage('Info') {
            steps {
                sh 'pwd'
                echo "Current Branch: ${BRANCH_NAME}"
                echo "Current Build Number => Image Tag: $IMAGE_TAG"
            }
        }
        // ==================== Stage: Checkout ====================
        stage('Checkout') {
            steps {
                // Checkout code from version control
                cleanWs()
                echo 'Checking out code from GitHub...'

                // ดึงโค้ดจาก GitHub
                git(
                    url: "https://github.com/${GITHUB_ORG}/${GITHUB_REPO}.git",
                    branch: "${BRANCH_NAME}",
                    credentialsId: "github-org-token"
                )
            }
        }

        // ==================== Stage: Ansible Health Check ====================
        stage('Infra: Ansible Health Check') {
            steps {
                dir("${env.ANSIBLE_PATH}") {
                    echo 'Running Ansible health check...'
                    sh '''
                        ansible all -i hosts.ini \
                        -m ping \
                        -e "do_server_host=${DO_SERVER_HOST}" \
                        -e "ansible_ssh_private_key_file=${SSH_PVT_KEY_PATH}" \
                        -e "ansible_user=${SSH_USER}"
                    '''
                }
            }
        }

        // ==================== Stage: Ansible Setup ====================
        stage('Infra: Ansible Setup') {
            steps {
                dir("${env.ANSIBLE_PATH}") {
                    echo 'Running Ansible setup for Docker...'
                    sh '''
                        ansible-playbook -i hosts.ini \
                        setup/docker.yaml \
                        -e "do_server_host=${DO_SERVER_HOST}" \
                        -e "ansible_ssh_private_key_file=${SSH_PVT_KEY_PATH}" \
                        -e "ansible_user=${SSH_USER}"
                    '''
                    /*script {
                        // Check Docker
                        def dockerExists = sh(
                            script: 'docker version | grep "Version"',
                            returnStatus: true
                        ) == 0

                        if (!dockerExists) {
                            echo "Docker not found. Running Ansible Setup for Docker..."
                            sh 'ansible-playbook -i hosts.ini setup/docker.yaml'

                            sleep 5
                        } else {
                            echo "Docker is already set up. Skipping Docker setup."
                        }
                    }*/
                }
            }
        }

        // ==================== Stage: Build Parallel ====================
        stage('Build Parallel') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        echo 'Building Frontend...'
                        dir("${env.FRONTEND_PATH}") {
                            sh 'docker build -t $FE_IMAGE:$IMAGE_TAG .'
                        }
                    }
                }
                stage('Build Backend') {
                    steps {
                        echo 'Building Backend...'
                        /*dir("${env.BACKEND_PATH}") {
                            sh 'docker build -t $BE_IMAGE:$IMAGE_TAG .'
                        }*/
                    }
                }
            }
        }

        // ==================== Stage: Push to Docker Hub ====================
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-token',
                    usernameVariable: 'DOCKER_USERNAME', 
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    echo 'Logging in to Docker Hub...'
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                    sleep 5

                    // Change Tag
                    echo 'Changing image tags...'
                    // Frontend
                    sh 'docker tag $FE_IMAGE:$IMAGE_TAG $DOCKER_USERNAME/$DOCKER_REPO:$FE_IMAGE-$IMAGE_TAG'
                    // Backend
                    //sh 'docker tag $BE_IMAGE:$IMAGE_TAG $DOCKER_USERNAME/$DOCKER_REPO:$BE_IMAGE-$IMAGE_TAG'

                    echo 'Pushing images to Docker Hub...'
                    sh 'docker push $DOCKER_USERNAME/$DOCKER_REPO:$FE_IMAGE-$IMAGE_TAG'
                    //sh 'docker push $DOCKER_USERNAME/$DOCKER_REPO:$BE_IMAGE-$IMAGE_TAG'
                }
            }
        }

        // ==================== Stage: Deploy with Ansible ====================
        stage('Infra: Delivery with Ansible') {
            steps {
                dir("${env.ANSIBLE_PATH}") {
                    echo 'Delivering application with Ansible...'
                    sh """
                        ansible-playbook -i hosts.ini \
                        delivery.yaml \
                        -e "image_tag=$IMAGE_TAG"
                    """
                }
            }
        }

        // ==================== Stage: Cleanup ====================
        stage('Cleanup') {
            steps {
                echo 'Cleaning up local Docker images...'

                sh "docker rmi $DOCKER_USERNAME/$DOCKER_REPO:$FE_IMAGE-$IMAGE_TAG || true"
                //sh "docker rmi $DOCKER_USERNAME/$DOCKER_REPO:$BE_IMAGE-$IMAGE_TAG || true"

                sh "docker rmi -f $FE_IMAGE:$IMAGE_TAG || true"
                //sh "docker rmi -f $BE_IMAGE:$IMAGE_TAG || true"

                sh "docker images | grep $FE_IMAGE-$IMAGE_TAG || echo \"No local image for $FE_IMAGE-$IMAGE_TAG\""
                //sh "docker images | grep $BE_IMAGE-$IMAGE_TAG || echo \"No local image for $BE_IMAGE-$IMAGE_TAG\""

                sh 'docker logout'
            }
        }
    }
}