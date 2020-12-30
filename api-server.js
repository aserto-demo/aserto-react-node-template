const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyParser = require('body-parser');
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const authConfig = require("./src/auth_config.json");

// retrieve the authz middleware
const { jwtAuthz, accessMap } = require("express-jwt-aserto");

const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;
const authorizerServiceUrl = authConfig.authorizerServiceUrl || 'https://localhost:8383';
const applicationName = authConfig.applicationName || 'mycars';

if (!authConfig.domain || !authConfig.audience || !authConfig.authorizerServiceUrl) {
  throw new Error(
    "Please make sure that auth_config.json is in place and populated"
  );
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));
app.use(bodyParser.json());

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"]
});

// use jwt middleware to validate the JWT and extract its claims into the 'user' key
app.use(checkJwt);

// hack the user name
app.use((req, res, next) => {
  req.user.sub = 'euang@contoso.com';
  next();
});

// set up middleware to return the access map for this service, passing in authorizer service hostname
app.use(accessMap({ authorizerServiceUrl, applicationName }));

// check authorization by inserting scopes in the array
const checkAuthz = jwtAuthz([
  // 'call:externalapi'
], { authorizerServiceUrl, applicationName });

app.get("/api/external", checkAuthz, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!"
  });
});

// register the cars api handlers
const apiCars = require('./api-cars');
apiCars.register(app, checkAuthz);

app.listen(port, () => console.log(`API Server listening on port ${port}`));
