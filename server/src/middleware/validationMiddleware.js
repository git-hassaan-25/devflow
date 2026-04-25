/**
 * Validation Middleware
 * Validates incoming request body against a Zod schema
 * 
 * Usage:
 *   router.post('/register', validate(registerSchema), register);
 * 
 * On success: attaches validated & parsed data to req.validated
 * On failure: returns 400 with detailed error messages
 */

export function validate(schema) {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.body);
            req.validated = validated;
            next();
        } catch (err) {
            // Zod throws ZodError with .errors array
            if (err.errors) {
                const fieldErrors = err.errors.reduce((acc, error) => {
                    const field = error.path.join('.');
                    acc[field] = error.message;
                    return acc;
                }, {});

                return res.status(400).json({
                    message: 'Validation failed',
                    errors: fieldErrors,
                });
            }

            // Fallback for unexpected errors
            next(err);
        }
    };
}
