const config = {
  devKey: process.env.FEATURE_DEVKEY_SHARED,
  dir: __dirname,
  experiments: [
    // REPLACE THIS EXPERIMENT WHEN ADDING THE FIRST ONE. IT BREAKS IF NONE EXIST
    {
      name: 'nameEx',
      default: true,
      description: 'Short description. Owner/Author/Team: Unknown',
    },
  ],
}

module.exports = config
