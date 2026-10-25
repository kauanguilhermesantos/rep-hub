package com.rephub.exceptions;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Erros de @Valid (campo faltando, formato inválido, etc.) viram um mapa
    // { "campo": "mensagem" } em vez do JSON gigante que o Spring gera por padrão.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> erros = new LinkedHashMap<>();
        for (FieldError erro : ex.getBindingResult().getFieldErrors()) {
            erros.put(erro.getField(), erro.getDefaultMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erros);
    }

    // Fallback para violação de índice único (ex: e-mail duplicado) que não
    // tenha sido tratada localmente no controller — evita um 500 cru.
    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<String> handleDuplicateKey(DuplicateKeyException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("Já existe um registro com esse valor único");
    }

    // Refresh token inválido, já usado (rotacionado) ou expirado
    @ExceptionHandler(RefreshTokenInvalidoException.class)
    public ResponseEntity<String> handleRefreshTokenInvalido(RefreshTokenInvalidoException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
    }

    // Recurso não existe ou pertence a outro usuário
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<String> handleNaoEncontrado(RecursoNaoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    // Operação bloqueada por regra de negócio (ex.: alterar pedidos de viagem finalizada)
    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<String> handleRegraNegocio(RegraNegocioException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    // JSON malformado, data inválida, categoria inexistente etc.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleCorpoIlegivel(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Dados inválidos: verifique os campos enviados");
    }

    // Parâmetro de URL com formato inválido (ex.: status desconhecido, data fora de yyyy-MM-dd)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> handleTipoInvalido(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Parâmetro inválido: " + ex.getName());
    }
}
