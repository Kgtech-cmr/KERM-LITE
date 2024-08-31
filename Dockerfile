FROM quay.io/lyfe00011/md:beta
RUN git clone https://github.com/Kgtech-cmr/KERM-LITE-MD.git /root/Kerm/
WORKDIR /root/Kerm/
RUN yarn install
CMD ["npm", "start"]