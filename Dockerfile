FROM nginx:alpine

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# create file store
RUN mkdir -p /var/www/disaster/html/store

# Copy your custom nginx.conf to the container
COPY ssl /ssl
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built files from the host to the container
COPY build /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]