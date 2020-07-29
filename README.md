# Cryptic Activist

> Cryptic Activist is a MERN Stack based platform focused on online courses, blog posts and podcast about the world crypto world and libertarian causes. 

> This project is still under development and it has not been deployed yet but you can test it in your own local machine.

> Before procedure with the following instructions make sure that `Node` and `Yarn` are installed in your machine.

## 1 Installation

### 1.1 Clone the required repository:

[Automation Scripts](https://github.com/Davi-Silva/automation_scripts)

### 1.2 Open terminal and run the file mern_install_dependencies.sh

```bash
./automation_scripts/mern_install_dependencies.sh
```
If you get the following error message:
```bash
error cryptic-activist-backend@1.0.0: The engine "node" is incompatible with this module. Expected version "required node version". Got "your actual node version"
```

Then navigate to the `./cryptic-activist/backend/package.json` and change the following code:

```json
"engines": {
    "node": "your node version"
},
```
to
```json
"engines": {
    "node": "required node version"
},
```

After fixing the node issue navigate to `./cryptic-activist-backend` via terminal run the following command:

```bash
yarn install
```

### 1.3 Setup some important environment variables

In order to get everything working as planned a .env file with some environment variables is required.

#### 1.3.1 Create your own environment variables:

Navigate to `cryptic-activist/backend` and create a `.env` file then copy and paste the following piece of code and replace it with your own environment variables:

```env
APP_URL=WEBSITE_URL
ATLAS_URI=YOUR_MONGODB_ATLAS_URI
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
BUCKET_NAME=YOUR_AWS_S3_BUCKET_NAME
STORAGE_TYPE=s3
```

And then finally run the following command:

```bash
./automation_scripts/mern_start_dev.sh
```

After the installation process is completed you should be good to go.

Developed by _**Davi Silva**_