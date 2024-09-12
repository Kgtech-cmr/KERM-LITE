### Termux Setup Script

```bash
pkg update && pkg upgrade -y
pkg install nodejs -y
pkg install curl -y
pkg install ffmpeg -y
pkg install git -y
pkg install python -y
pkg install openssh -y
pkg install nano -y
pkg install wget -y
pkg clean
git clone https://github.com/FXastro/fxop-md
cd fxop-md
npm install
npm start
```

### What you need to do!

1. **Cloning the Repository**:
   - `git clone https://github.com/FXastro/fxop-md`: Clones the repository into the current directory.
   - `cd fxop-md`: Changes the directory to the cloned repository folder.

2. **Create an `.env` File**:
   - `echo 'SESSION_ID="your_session_id_here"' > .env`: Creates a `.env` file with the `SESSION_ID` environment variable.
   - `echo 'BOT_INFO="your_bot_info_here"' >> .env`: Appends the `BOT_INFO` environment variable to the `.env` file.
   - `echo 'SUDO="your_sudo_here"' >> .env`: Appends the `SUDO` environment variable to the `.env` file.

### Steps to Run the Extended Script (Optional)

1. Save the script to a file named `termux-setup.sh`.
2. Make it executable:
   ```bash
   chmod +x termux-setup.sh
   ```
3. Run the script:
   ```bash
   ./termux-setup.sh
   ```

### Very Important

Replace `your_session_id_here`, `your_bot_info_here`, and `your_sudo_here` with your actual values as needed.

The script will install the necessary packages, clone the specified repository, and set up the environment variables automatically.
