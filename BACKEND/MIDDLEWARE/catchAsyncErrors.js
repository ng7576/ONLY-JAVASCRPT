module.exports = errAsync => (req, res, next) =>
{
Promise.resolve(errAsync(req, res, next)).catch(next);
};