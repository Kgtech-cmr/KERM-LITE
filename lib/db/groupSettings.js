const config = require("../../config");
const { DataTypes } = require("sequelize");

const GroupSettingsDB = config.DATABASE.define("GroupSettings", {
  chat: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  antiPromote: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  antiDemote: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

async function getAntiPromote(jid = null) {
  const settings = await GroupSettingsDB.findOne({
    where: {
      chat: jid,
    },
  });

  return settings ? settings.dataValues.antiPromote : false;
}

async function setAntiPromote(jid = null, status = false) {
  const [settings, created] = await GroupSettingsDB.findOrCreate({
    where: { chat: jid },
    defaults: { antiPromote: status },
  });

  if (!created) {
    await settings.update({ antiPromote: status });
  }

  return settings;
}

async function getAntiDemote(jid = null) {
  const settings = await GroupSettingsDB.findOne({
    where: {
      chat: jid,
    },
  });

  return settings ? settings.dataValues.antiDemote : false;
}

async function setAntiDemote(jid = null, status = false) {
  const [settings, created] = await GroupSettingsDB.findOrCreate({
    where: { chat: jid },
    defaults: { antiDemote: status },
  });

  if (!created) {
    await settings.update({ antiDemote: status });
  }

  return settings;
}

module.exports = {
  GroupSettingsDB,
  getAntiPromote,
  setAntiPromote,
  getAntiDemote,
  setAntiDemote,
};
