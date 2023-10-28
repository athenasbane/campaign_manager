const contentfulManagement = require("contentful-management")
require("dotenv").config()

module.exports = function() {
  const contentfulClient = contentfulManagement.createClient({
    accessToken: process.env.REACT_APP_CONTENTFUL_CMA_ACCESS_TOKEN,
  })

  return contentfulClient
    .getSpace(process.env.REACT_APP_CONTENTFUL_SPACE_ID)
    .then(space => space.getEnvironment(process.env.REACT_APP_CONTENTFUL_ENVIRONMENT))
}