const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/auth/github/callback`,
      scope: ['read:user', 'user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;

        if (user) {
          user.displayName = profile.displayName || profile.username;
          user.avatarUrl = profile.photos[0]?.value || '';
          user.bio = profile._json?.bio || '';
          user.accessToken = accessToken;
          await user.save();
        } else {
          user = await User.create({
            githubId: profile.id,
            username: profile.username,
            displayName: profile.displayName || profile.username,
            email,
            avatarUrl: profile.photos[0]?.value || '',
            bio: profile._json?.bio || '',
            profileUrl: profile.profileUrl,
            accessToken,
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
