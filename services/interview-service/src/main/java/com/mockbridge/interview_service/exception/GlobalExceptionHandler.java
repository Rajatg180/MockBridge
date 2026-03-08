package com.mockbridge.interview_service.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> missingBody(HttpMessageNotReadableException ex, HttpServletRequest req) {
        ApiErrorResponse body = new ApiErrorResponse(
                400, "Bad Request", "Request body is required", req.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> validation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        String msg = ex.getBindingResult().getFieldErrors().isEmpty()
                ? "Validation failed"
                : ex.getBindingResult().getFieldErrors().get(0).getField() + " " +
                  ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();

        ApiErrorResponse body = new ApiErrorResponse(
                400, "Bad Request", msg, req.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> badRequest(IllegalArgumentException ex, HttpServletRequest req) {
        ApiErrorResponse body = new ApiErrorResponse(
                400, "Bad Request", ex.getMessage(), req.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiErrorResponse> internal(RuntimeException ex, HttpServletRequest req) {
        ApiErrorResponse body = new ApiErrorResponse(
                500, "Internal Server Error", ex.getMessage(), req.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}