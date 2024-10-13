pipeline {
    agent any

    tools {
        nodejs "NodeJS"  // Reference to the NodeJS tool defined in Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/randihaboc/create-react-app.git' // Replace with your repository URL
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test -- --watchAll=false'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying React app...'
                // Add deployment steps here if necessary
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Build successful!'
        }
        failure {
            echo 'Build failed.'
        }
    }
}
