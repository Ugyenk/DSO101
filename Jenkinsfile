pipeline {
    agent any
    
    environment {
        WORKSPACE_PATH = 'Ugyen Kinley Phuntshok_02240337_DSO101_A1'
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS = 'docker-hub-creds'
    }
    
    stages {

        // Stage 1: Pull code from GitHub
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Ugyenk/DSO101.git',
                    credentialsId: 'github-creds'
            }
        }

        // Stage 2: Install dependencies for backend
        stage('Install Backend Dependencies') {
            steps {
                dir('${WORKSPACE_PATH}/backend') {
                    script {
                        if (isUnix()) {
                            sh 'npm install'
                        } else {
                            bat 'npm install'
                        }
                    }
                }
            }
        }

        // Stage 3: Install dependencies for frontend
        stage('Install Frontend Dependencies') {
            steps {
                dir('${WORKSPACE_PATH}/frontend') {
                    script {
                        if (isUnix()) {
                            sh 'npm install'
                        } else {
                            bat 'npm install'
                        }
                    }
                }
            }
        }

        // Stage 4: Build frontend
        stage('Build Frontend') {
            steps {
                dir('${WORKSPACE_PATH}/frontend') {
                    script {
                        if (isUnix()) {
                            sh 'npm run build'
                        } else {
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        // Stage 5: Build Docker images
        stage('Build Docker Images') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'cd ${WORKSPACE_PATH} && docker-compose build'
                    } else {
                        bat 'cd %WORKSPACE_PATH% && docker-compose build'
                    }
                }
            }
        }

        // Stage 6: Push Docker images to registry
        stage('Push Docker Images') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        if (isUnix()) {
                            sh '''
                                echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                                docker tag todo-backend:latest $DOCKER_USER/todo-backend:latest
                                docker tag todo-frontend:latest $DOCKER_USER/todo-frontend:latest
                                docker push $DOCKER_USER/todo-backend:latest
                                docker push $DOCKER_USER/todo-frontend:latest
                                docker logout
                            '''
                        } else {
                            bat '''
                                echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                                docker tag todo-backend:latest %DOCKER_USER%/todo-backend:latest
                                docker tag todo-frontend:latest %DOCKER_USER%/todo-frontend:latest
                                docker push %DOCKER_USER%/todo-backend:latest
                                docker push %DOCKER_USER%/todo-frontend:latest
                                docker logout
                            '''
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
