/**
 * Centralized Error Handler Middleware (Merkezi Hata Yönetimi)
 * Express uygulaması içinde fırlatılan tüm beklenmeyen yakalanmamış hataları (500)
 * veya özel hataları standart bir JSON formatında istemciye sunar.
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`❌ [Hata Logu]: ${err.stack || err.message}`);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.name || 'Server Error',
    message: err.message || 'Sunucu tarafında beklenmeyen bir hata oluştu.'
  });
};
