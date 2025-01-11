# Campaign Manager

## Description

Campaign Manager is a TTRPG Campaign managing website. The site connects to a CMS and builds the website around the content that you would like to be visable to your players. You can see a version of this at [Teratin](https://teratin.info)

Current features include:

- List Pages
- Lore Pages
- Session Recaps
- Maps (With interactive Features such as distance calculations)
- Mission Tracking
- Documents

## The Plan

I want this to be a open source campaign manager tool in future. This allows you to manage your campaign for pretty much free. My current costs for hosting are $0.61 a month to host. Using AWS but I'm pretty sure you could get that to be free with some fiddling.

## Future Development

### MVP

Completely white label the application so that anyone can fork the repo and deploy their own version using their own Contentful user.

### Future

Account based administration. This will involve:

- Authentication
- White labeling of Contentful via an administration panel
- Further Test coverage

### Setup

If you want to create your own clone of this site go ahead things to do:

For this to work you will need to fork the project create a .env file at the route level this needs to contain these params

You will need to get the space id and access token from Contentful by making an account.

```
REACT_APP_CONTENTFUL_SPACE_ID=
REACT_APP_CONTENTFUL_ACCESS_TOKEN=
```

The github actions run tests and deployments for you but the deployment steps require a AWS account with the infrastructure set up and a cli account for AWS with keys provided to github. If you want more guidance on this I can make a video.

If you want to host this else where you can just build the static files using the yarn build command.

Remember to remove the references to Tordenhelm, Noktblast, Eldoria and Teratin. (These will be moved to my contentful in future)

Any problems raise an issue and I'll help or improve the whitelabeling of this application.
