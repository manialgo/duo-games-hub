@echo off
cd /d "C:\Mani\game_dev\tilt-tower-coop"
echo === Installing dependencies...
"C:\Program Files\nodejs\npm.cmd" install
echo.
echo === Building project...
"C:\Program Files\nodejs\npm.cmd" run build
echo.
echo === DONE! Run 'npm run dev' to start the dev server.
pause
