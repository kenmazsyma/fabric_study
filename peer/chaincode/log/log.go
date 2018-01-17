/*
Package log provides object for logging
*/

package log

import (
	"fmt"
	"log"
	"os"
	"runtime"
)

type Level int

const (
	LEVEL_DEBUG Level = iota
	LEVEL_DEPLY
)

var level Level

// build is a function for formatting parameter
//   parameters :
//     val - base string
//     lvl - error level
//     a   - parameters inserted to string
func build(val string, lvl string, a ...interface{}) string {
	_, file, line, _ := runtime.Caller(2)
	pref := fmt.Sprintf("[%s] %s(%d) : ", lvl, file, line)
	if len(a) == 0 {
		return pref + val
	} else {
		return fmt.Sprintf(pref+val, a...)
	}
}

// Init is a function for initializing logging function
//   parameters :
//     name - prefix of log text
//     l - output level
func Init(name string, l Level) {
	log.SetPrefix(name + ":")
	log.SetOutput(os.Stdout)
	//log.SetFlags(log.Lshortfile | log.Ldate | log.Ltime)
	level = l
}

// Debug is a function for outputting debug log
func Debug(val string, a ...interface{}) {
	if level == LEVEL_DEBUG {
		log.Println(build(val, "DEBUG", a...))
	}
}

func D(val string, a ...interface{}) {
	if level == LEVEL_DEBUG {
		log.Println(build(val, "DEBUG", a...))
	}
}

// DebugB is a function for outputting debug log
func DebugB(val []byte) {
	if level == LEVEL_DEBUG {
		log.Println("[DEBUG]" + string(val))
	}
}

// Info is a function for outputting info level log
func Info(val string, a ...interface{}) {
	log.Println(build(val, "INFO", a...))
}

// Error is a function for outputting error log
func Error(val string, a ...interface{}) {
	log.Println(build(val, "ERROR", a...))
}
