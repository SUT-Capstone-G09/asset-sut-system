package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type successBody struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
}

type errorBody struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

func OK(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, successBody{Success: true, Data: data})
}

func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, successBody{Success: true, Data: data})
}

func BadRequest(c *gin.Context, msg string) {
	c.JSON(http.StatusBadRequest, errorBody{Success: false, Error: msg})
}

func Unauthorized(c *gin.Context, msg string) {
	c.JSON(http.StatusUnauthorized, errorBody{Success: false, Error: msg})
}

func Forbidden(c *gin.Context, msg string) {
	c.JSON(http.StatusForbidden, errorBody{Success: false, Error: msg})
}

func NotFound(c *gin.Context, msg string) {
	c.JSON(http.StatusNotFound, errorBody{Success: false, Error: msg})
}

func InternalError(c *gin.Context, msg string) {
	c.JSON(http.StatusInternalServerError, errorBody{Success: false, Error: msg})
}
