pipeline {
    agent any
    
    environment {
        // Define any environment variables here
        // Githib
        GITHUB_REPO = 'asset-sut-system'
        GITHUB_ORG = 'SUT-Capstone-G09'  // Replace with your GitHub organization or username

        // Docker
        DOCKER_REPO = 'asset-sut'
        FE_IMAGE = 'frontend'
        BE_IMAGE = 'backend'
        IMAGE_TAG = "v${env.BUILD_NUMBER}" // Tag images with the build number

        FE_CONTAINER = 'fe-container'
        BE_CONTAINER = 'be-container'

        // Path
        REPO_PATH = "${env.WORKSPACE}/${GITHUB_REPO}" // Path to your cloned repository
        FRONTEND_PATH = "${REPO_PATH}/apps/frontend" // Path to your frontend code
        BACKEND_PATH = "${REPO_PATH}/apps/backend" // Path to your backend code
    }

    stages {
        // ==================== Stage: Checkout ====================
        stage('Checkout') {
            steps {
                cleanWs()

                withCredentials([
                    usernamePassword(
                        credentialsId: 'asset-sut-token',
                        usernameVariable: 'GITHUB_USERNAME',
                        passwordVariable: 'GITHUB_TOKEN'
                    )
                ]) {
                    sh  '''
                        git clone -b deploy-v1 https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_ORG}/${GITHUB_REPO}.git
                        '''
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
                            sh 'pwd && ls -la'
                            sh 'docker build -t $FE_IMAGE:$IMAGE_TAG .'
                        }
                    }
                }
                stage('Build Backend') {
                    steps {
                        echo 'Building Backend...'
                        dir("${env.BACKEND_PATH}") {
                            sh 'pwd && ls -la'
                            sh 'docker build -t $BE_IMAGE:$IMAGE_TAG .'
                        }
                    }
                }
            }
        }

        // ==================== Stage: Push to Docker Hub ====================
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'asset-sut-token-docker',
                    usernameVariable: 'DOCKER_USERNAME', 
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    echo 'Logging in to Docker Hub...'
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                    sleep 5

                    // Change Tag
                    echo 'Changing image tags...'
                    // Frontend
                    sh 'docker tag $FE_IMAGE:$IMAGE_TAG $DOCKER_REPO:$FE_IMAGE-$IMAGE_TAG'
                    // Backend
                    sh 'docker tag $BE_IMAGE:$IMAGE_TAG $DOCKER_REPO:$BE_IMAGE-$IMAGE_TAG'

                    echo 'Pushing images to Docker Hub...'
                    sh 'docker push $DOCKER_USERNAME/$DOCKER_REPO:$FE_IMAGE-$IMAGE_TAG'
                    sh 'docker push $DOCKER_USERNAME/$DOCKER_REPO:$BE_IMAGE-$IMAGE_TAG'
                }
            }
        }

        // ==================== Stage: Cleanup ====================
        stage('Cleanup') {
            steps {
                echo 'Cleaning up local Docker images...'

                sh "docker rmi $DOCKER_USERNAME/$DOCKER_REPO:$FE_IMAGE-$IMAGE_TAG || true"
                sh "docker rmi $DOCKER_USERNAME/$DOCKER_REPO:$BE_IMAGE-$IMAGE_TAG || true"

                sh "docker rmi -f $FE_IMAGE:$IMAGE_TAG || true"
                sh "docker rmi -f $BE_IMAGE:$IMAGE_TAG || true"

                sh "docker images | grep $FE_IMAGE-$IMAGE_TAG || echo \"No local image for $FE_IMAGE-$IMAGE_TAG\""
                sh "docker images | grep $BE_IMAGE-$IMAGE_TAG || echo \"No local image for $BE_IMAGE-$IMAGE_TAG\""

                sh 'docker logout'
            }
        }
    }
}