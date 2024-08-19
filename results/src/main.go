package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/mattn/go-sqlite3"
	"github.com/rs/cors"
	"github.com/rs/xid"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/go-playground/validator.v9"
)

type Result struct {
	ID         string `json:"id"`
	Date       string `json:"date"`
	Notes      string `json:"notes"`
	InRange    int    `json:"inRange"`
	OutOfRange int    `json:"outOfRange"`
	SeenAt     string `json:"seenAt"`
}

type App struct {
	DB *sql.DB
}

func (a *App) Initialize() {
	sqlite3conn, err := sql.Open("sqlite3", "./results.db")
	if err != nil {
		panic(err)
	}

	sqlite3conn.Exec(`CREATE TABLE IF NOT EXISTS results (
		id TEXT PRIMARY KEY,
		date TEXT NOT NULL,
		notes TEXT,
		inRange INTEGER NOT NULL,
		outOfRange INTEGER NOT NULL,
		seenAt TEXT
	)`)
	a.DB = sqlite3conn
}

func (a *App) Close() {
	err := a.DB.Close()
	if err != nil {
		panic(err)
	}
}

func (a *App) GetAllResults() ([]Result, error) {
	rows, err := a.DB.Query("SELECT * FROM results")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := []Result{}
	for rows.Next() {
		r := Result{}
		err := rows.Scan(&r.ID, &r.Date, &r.Notes, &r.InRange, &r.OutOfRange, &r.SeenAt)
		if err != nil {
			return nil, err
		}
		results = append(results, r)
	}
	return results, nil
}

func (a *App) GetResult(id string) (Result, error) {
	r := Result{}
	err := a.DB.QueryRow("SELECT * FROM results WHERE id = ?", id).Scan(&r.ID, &r.Date, &r.Notes, &r.InRange, &r.OutOfRange, &r.SeenAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return r, errs.New("Result not found")
		} else {
			return r, err
		}
	}
	return r, nil
}

func (a *App) CreateResult(r Result) (Result, error) {
	r.ID = xid.New().String()
	stmt, err := a.DB.Prepare("INSERT INTO results(id, date, notes, inRange, outOfRange, seenAt) VALUES(?, ?, ?, ?, ?, ?)")
	if err != nil {
		return r, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(r.ID, r.Date, r.Notes, r.InRange, r.OutOfRange, r.SeenAt)

	return r, err
}

func (a *App) UpdateResult(id string, r Result) (Result, error) {
	stmt, err := a.DB.Prepare("UPDATE results SET date = ?, notes = ?, inRange = ?, outOfRange = ?, seenAt = ? WHERE id = ?")
	if err != nil {
		return r, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(r.Date, r.Notes, r.InRange, r.OutOfRange, r.SeenAt, id)
	if err != nil {
		return r, err
	}

	return r, nil
}

func (a *App) DeleteResult(id string) error {
	stmt, err := a.DB.Prepare("DELETE FROM results WHERE id = ?")
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(id)
	if err != nil {
		return err
	}

	return nil
}

func main() {
	app := &App{}
	app.Initialize()
	defer app.Close()

	router := mux.NewRouter()

	// Get all results
	router.HandleFunc("/results", func(w http.ResponseWriter, r *http.Request) {
		results, err := app.GetAllResults()
		if err != nil {
			log.Error(err)
			http.Response(w, zresponse.Error{Message: "Error getting results"})
			return
		}
		http.Response(w, results)
	}).Methods(http.MethodGet)

	// Get a result by ID
	router.HandleFunc("/results/{id}", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]

		result, err := app.GetResult(id)
		if err != nil {
			if errs.Unwrap(err).Error() == "Result not found" {
				zhttp.Response(w, zresponse.Error{Message: "Result not found"})
			} else {
				zlog.Error(err)
				zhttp.Response(w, zresponse.Error{Message: "Error getting result"})
			}
			return
		}

		zhttp.Response(w, result)
	}).Methods(http.MethodGet)

	// Create a result
	router.HandleFunc("/results", func(w http.ResponseWriter, r *http.Request) {
		var result Result
		err := zrequest.Bind(r, &result, ztype.JSON)
		if err != nil {
			zlog.Error(err)
			zhttp.Response(w, zresponse.Error{Message: "Invalid request body"})
			return
		}

		err = zvalidate.Check(result)
		if err != nil {
			zlog.Error(err)
			zhttp.Response(w, zresponse.Error{Message: "Validation error"})
			return
		}

		createdResult, err := app.CreateResult(result)
		if err != nil {
			zlog.Error(err)
			zhttp.Response(w, zresponse.Error{Message: "Error creating result"})
			return
		}

		zhttp.Response(w, createdResult)
	}).Methods(http.MethodPost)

	// Update a result by ID
	router.HandleFunc("/results/{id}", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]

		var result Result
		err := zrequest.Bind(r, &result, ztype.JSON)
		if err != nil {
			zlog.Error(err)
			zhttp.Response(w, zresponse.Error{Message: "Invalid request body"})
			return
		}

		err = zvalidate.Check(result)
		if err != nil {
			zlog.Error(err)
			zhttp.Response
			zhttp.Response(w, zresponse.Error{Message: "Validation error"})
			return
		}

		updatedResult, err := app.UpdateResult(id, result)
		if err != nil {
			zlog.Error(err)
			zhttp.Response(w, zresponse.Error{Message: "Error updating result"})
			return
		}

		zhttp.Response(w, updatedResult)
	}).Methods(http.MethodPut)

	// Delete a result by ID
	router.HandleFunc("/results/{id}", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]

		err := app.DeleteResult(id)
		if err != nil {
			zlog.Error(err)
			zhttp.Response(w, zresponse.Error{Message: "Error deleting result"})
			return
		}

		zhttp.Response(w, nil)
	}).Methods(http.MethodDelete)

	handler := cors.Default().Handler(router)

	log.Fatal(http.ListenAndServe(":8080", handler))
}
