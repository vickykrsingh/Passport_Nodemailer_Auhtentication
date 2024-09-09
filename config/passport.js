const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const poolDB = require('../config/db');

// Passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const name = profile.displayName;

        // Check if the user exists in the database
        const query = 'SELECT * FROM bayavasfdc.users WHERE email = $1';
        const result = await poolDB.query(query, [email]);

        if (result.rows.length > 0) {
          // User exists, check if they have verified their email
          const user = result.rows[0];

          if (user.google_id && user.google_id !== googleId) {
            // User is logged in with another Google account
            return done(null, false, { message: 'Email already linked to another Google account.' });
          }

          if (user.email_verified) {
            // User has verified email and is attempting to log in with Google
            return done(null, false, { message: 'Email already verified. You cannot log in with Google.' });
          }

          // Update the user with Google ID if it does not exist
          const updateQuery = 'UPDATE bayavasfdc.users SET google_id = $1 WHERE id = $2 RETURNING id, name, email, google_id';
          const updatedUserResult = await poolDB.query(updateQuery, [googleId, user.id]);
          return done(null, updatedUserResult.rows[0]);
        } else {
          // If user doesn't exist, create a new user
          const insertQuery = `
            INSERT INTO bayavasfdc.users (name, email, google_id)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, google_id
          `;
          const newUserResult = await poolDB.query(insertQuery, [name, email, googleId]);
          return done(null, newUserResult.rows[0]);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize and deserialize user for session support
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const query = 'SELECT * FROM bayavasfdc.users WHERE id = $1';
    const result = await poolDB.query(query, [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});
