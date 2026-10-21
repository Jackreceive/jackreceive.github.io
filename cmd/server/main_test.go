package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestHomepageRoutes(t *testing.T) {
	dir := t.TempDir()
	profile := filepath.Join(dir, "profile.json")
	if err := os.WriteFile(profile, []byte(`{"name":"示例"}`), 0600); err != nil {
		t.Fatal(err)
	}
	web := filepath.Join(dir, "web")
	if err := os.MkdirAll(filepath.Join(web, "assets"), 0700); err != nil {
		t.Fatal(err)
	}
	for path, body := range map[string]string{"index.html": "<h1>Homepage</h1>", "assets/app.js": "console.log('ok')"} {
		if err := os.WriteFile(filepath.Join(web, path), []byte(body), 0600); err != nil {
			t.Fatal(err)
		}
	}
	handler := newHandler(profile, web)
	for _, tc := range []struct {
		path string
		code int
	}{
		{"/", 200}, {"/api/profile", 200}, {"/api/health", 200},
		{"/assets/app.js", 200}, {"/missing.js", 404}, {"/api/missing", 404},
		{"/assets/", 404}, {"/data/profile.json", 404},
	} {
		t.Run(tc.path, func(t *testing.T) {
			w := httptest.NewRecorder()
			handler.ServeHTTP(w, httptest.NewRequest("GET", tc.path, nil))
			if w.Code != tc.code {
				t.Fatalf("status = %d, want %d", w.Code, tc.code)
			}
			if tc.path == "/api/profile" && !json.Valid(w.Body.Bytes()) {
				t.Fatal("invalid JSON")
			}
			if tc.path == "/assets/app.js" && w.Header().Get("Cache-Control") != "public, max-age=31536000, immutable" {
				t.Fatal("missing asset cache header")
			}
		})
	}
	if err := os.WriteFile(profile, []byte(`invalid`), 0600); err != nil {
		t.Fatal(err)
	}
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, httptest.NewRequest("GET", "/api/profile", nil))
	if w.Code != http.StatusServiceUnavailable {
		t.Fatalf("invalid profile: status = %d", w.Code)
	}
}
