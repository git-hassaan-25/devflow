export const ping = (req, res) => {
  res.json({
    status: 'ok',
    message: 'DevFlow API is alive',
    timestamp: new Date().toISOString(),
  });
};
