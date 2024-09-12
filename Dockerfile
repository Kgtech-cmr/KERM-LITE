FROM quay.io/astrofx011/fx-bot:latest
RUN npm install -g npm@latest
RUN git clone https://github.com/Kgtech-cmr/KERM-LITE.
RUN npm install
CMD ["npm", "start"]