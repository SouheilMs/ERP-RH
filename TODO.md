# CI/CD Pipeline Implementation TODO

## Tasks to Complete
- [x] Add JaCoCo plugin to backend/pom.xml for test coverage reports
- [x] Update .gitlab-ci.yml to use Docker Hub registry properly (fix image names)
- [x] Update frontend/Dockerfile to correct copy path and build command
- [x] Update .gitlab-ci.yml to use node:20-alpine for frontend jobs
- [x] Set up GitLab CI variables (DOCKERHUB_USERNAME: sirine, DOCKERHUB_PASSWORD: Admin123!, SONAR_HOST_URL: host_url, SONAR_TOKEN: token_sonar, SSH_PRIVATE_KEY: private_key)
- [ ] Push changes to GitLab repository
- [ ] Test the pipeline execution
- [ ] Verify Docker images are pushed to Docker Hub on merge to main
- [ ] Ensure SonarQube analysis works (bonus)
