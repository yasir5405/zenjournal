export const errorHandler = (err, req, res, next) => {
  // console.log("Consoled Error: ", err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";

  res.status(statusCode).json({
    success: false,
    message,
  });
};
