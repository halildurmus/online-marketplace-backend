/**
 * Wraps the provided async functions to avoid uncaught promise errors
 * to go silent.
 * @param 	{function} fn	async function.
 * @returns {function(*=, *=, *=): void}
 */
const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next)

module.exports = catchAsync
