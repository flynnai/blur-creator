# --no-standard-libraries: don't use libc
# --Wl --export-all: export all symbols to be used in JS
# --Wl --no-entry: don't check for main
clang --target=wasm32 --no-standard-libraries -Wl,--export-all -Wl,--no-entry -o main.wasm main.c