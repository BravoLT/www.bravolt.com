This site is built with [Hugo](https://gohugo.io/) a lot of their docs will be immensely helpful depending on what you are trying to do :) 

## Dependencies

- [Hugo](https://gohugo.io/getting-started/installing/)
- Just Hugo

## Structure

Hugo sites have a lot of semi-confusing folders so here is the basic structure of our website (listing only the folders we need :) )

```
AWSLambdaFunctions | Not from Hugo, contains lambda function for contact page
content | Contains a folder for wach subpage of the website contains blog entries or just a _index.md file
data | Contains text, image paths, etc for each page
public | The build directory - Note this could be removed from Git but it makes it easier for non-devs
static | Everything in this folder will be put into the build starting at the root. ie static/images = www.bravolt.com/images
themes | Contains our theme for the site (default html, css, etc)
```

## Local Server

Hugo has a built in web server with hot reloading to make it a million times easier to do dev

```bash
hugo serve

#If you want to access from your phone or another comptuer
hugo server --bind your.local.ip.address --baseURL http://your.local.ip.address
```

## Making Edits

### Basic Edits

Most edits for just text or images, adding / removing job descriptions will only touch the data & static directory. Just edit the yml files and see your changes on [localhost](http://localhost) before building and deploying

### Adding / Removing Job Description

If adding a job description add the pdf to static/images/jobdescriptions

Open data/careers.yml and under the list array just add another -name and "linkToImage" copying the style from the other ones. Or if removing, remove the desired description

### Adding a page

1. Make a new directory with the page name under themes/navigator-hugo/layouts with a list.html file in it with the following schema

```html
{{ partial "header.html" . }}

{{ partial "preloader.html" . }}

{{ partial "navigation.html" . }}

{{ partial "page-title.html" . }}

{{ partial "yourpage-content.html" . }}

{{ partial "footer.html" . }}
```

 2. in themes/navigator-hugo/layouts/partials create [yourpage]-content.html this is where all your HTML for your custom page will live. To make edits to this easier you can read Hugo's docs on data or look at other examples in this repo so you can have all the text and image paths live in the data folder

 3. Create a folder with the same name you created in layouts but in the /content directory, add a _index.md file to it

```
---
title   : "Your Title"
date    : 2018-07-07T12:37:52+06:00
draft   : false
---
```

  4. If you can get to localhost:[port]/yourpage try restarting your server and it should be live :D

## Deploying

Deploying is made easy with Hugo if you have [AWS CLI](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwiw27iK7NbpAhWDU80KHZz5AF4QjBAwAXoECAkQCw&url=https%3A%2F%2Fdocs.aws.amazon.com%2Fcli%2Flatest%2Fuserguide%2Fcli-chap-install.html&usg=AOvVaw0TXbwwlF2csmSHSoV7Obg6) setup, if you don't there is still a work around. To get creds for AWS CLI, open AWS, go to the IAM service and create new Access credentials and follow AWS's docs on adding the creds to the CLI app. 

### The easy way

Assuming you have the AWS CLI setup

```bash
# This builds the site to the public dir
hugo 
# This pushes to S3 and invalidates our Cloud Front distribution (removes front end cache)
hugo deploy s3
```

### The "hard" way

First build the site 

```bash
hugo
```

Now login to AWS → S3 → www.bravolt.com

drag all of the files from the public directory onto the S3 bucket, hit upload, press "yes I want to replace" if prompted

Open AWS → CloudFront

Open the distribution settings for [www.bravolt.com](http://www.bravolt.com), go to invalidations, create invalidation and use an asterisk to invalidate everything. This will force CloudFront to ditch its cache and go get new copies of the S3 objects.
