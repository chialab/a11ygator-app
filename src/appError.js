class AppError extends Error {
    constructor(message, status, previous) {
        super(message);

        this.status = status;
        this.previous = previous;
    }
}

module.exports = AppError;
