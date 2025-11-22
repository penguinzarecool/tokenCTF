package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

var validUsers = map[string]string {
    "user":     "password",
    "admin":    "secretpassword",
}

func genToken( username string ) string {
    return "token-" + username + "-12345"    // TODO: Change token generation
}

func validateToken( token string ) bool {
    return len( token ) > 0 && ( token == "token-user-12345" || token == "token-admin-12345" )
}

func tokenFromRequest( r *http.Request ) string {

    token := r.URL.Query( ).Get( "token" )
    if token != "" {
        return token
    }

    cookie, err := r.Cookie( "session" )
    if err == nil {
        return cookie.Value
    }

    return ""
}


func main( ) {

    fs := http.FileServer( http.Dir( "./static" ) )
    http.Handle( "/static/", http.StripPrefix( "/static/", fs ) )

    http.HandleFunc( "/", func( w http.ResponseWriter, r *http.Request ) {
        http.ServeFile( w, r, "./static/login.html" )
    } )

    http.HandleFunc( "/login", func( w http.ResponseWriter, r *http.Request ) {
        if r.Method != "POST" {
            http.Error(w, "invalid method", http.StatusMethodNotAllowed )
            return
        }

        username := r.FormValue( "username" )
        password := r.FormValue( "password" )

        if validUsers[username] != password {
            json.NewEncoder( w ).Encode( map[string]string {
                "error": "invalid credentials",
            } )
            return;
        }

        token := genToken( username )

        http.SetCookie( w, &http.Cookie {
            Name:       "session",
            Value:      token,
            Path:       "/",
            HttpOnly:   true,    // not readable by other tabs
        } )

        json.NewEncoder( w ).Encode( map[string]string {
            "token": token,
        } )
    } )

    // user page
    http.HandleFunc( "/user", func( w http.ResponseWriter, r *http.Request ) {
        
        //token := r.URL.Query( ).Get( "token" )
        token := tokenFromRequest( r )

        if !validateToken( token ) {
            http.Error( w, "Invalid Token", 401 )
            return
        }

        http.ServeFile( w, r, "./static/user.html" )
    } )

    // admin page
    http.HandleFunc( "/admin", func( w http.ResponseWriter, r *http.Request ) {
        
        //token := r.URL.Query( ).Get( "token" )
        token := tokenFromRequest( r )
        username := r.URL.Query( ).Get( "username" )

        if !validateToken( token ) {
            http.Error( w, "Invalid Token", 401 )
            return
        }

        fmt.Println( "ADMIN PAGE ACCESSED AS: ", username )
        http.ServeFile( w, r, "./static/admin.html" )
    } )

    fmt.Println( "Server running on http://localhost:8080" )
    http.ListenAndServe( ":8080", nil )

}
