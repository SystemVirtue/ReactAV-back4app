# Using a specific version for consistency
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json and package-lock.json are copied
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Your application's default port, make sure this matches your application's listening port
EXPOSE 3000
CMD ["npm", "start"]
