/******************************************************************************** 
*  WEB322 – Assignment 06
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: Noah Abebe Student ID: 142483239 Date:5/31/24
* 
********************************************************************************/ 
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

const Theme = sequelize.define('Theme', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: false,
});

const Set = sequelize.define('Set', {
  set_num: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  year: {
    type: DataTypes.INTEGER,
  },
  num_parts: {
    type: DataTypes.INTEGER,
  },
  theme_id: {
    type: DataTypes.INTEGER,
  },
  img_url: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: false, 
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getAllSets() {
  return new Promise((resolve, reject) => {
    Set.findAll({ include: [Theme] })
      .then((sets) => {
        resolve(sets);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    Set.findAll({ 
      where: { set_num: setNum }, 
      include: [Theme] 
    })
    .then((sets) => {
      if (sets.length > 0) {
        resolve(sets[0]);
      } else {
        reject('Unable to find requested set');
      }
    })
    .catch((error) => {
      reject(error);
    });
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    Set.findAll({ 
      include: [Theme], 
      where: { 
        '$Theme.name$': {
          [Sequelize.Op.iLike]: `%${theme}%`
        }
      } 
    })
    .then((sets) => {
      if (sets.length > 0) {
        resolve(sets);
      } else {
        reject('Unable to find requested sets');
      }
    })
    .catch((error) => {
      reject(error);
    });
  });
}

function getAllThemes() {
  return new Promise((resolve, reject) => {
    Theme.findAll()
      .then(themes => {
        resolve(themes);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function addSet(setData) {
  return new Promise((resolve, reject) => {
    Set.create(setData)
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err.errors[0].message);
      });
  });
}

function editSet(set_num, setData) {
  return new Promise((resolve, reject) => {
   
    const { set_num: _, ...updatedData } = setData;

    Set.update(updatedData, { where: { set_num } })
      .then(([affectedRows]) => {
        if (affectedRows > 0) {
          resolve();
        } else {
          reject('No set found to update');
        }
      })
      .catch((error) => {
        if (error.errors && error.errors.length > 0) {
          reject(error.errors[0].message);
        } else {
          reject('An error occurred while updating the set.');
        }
      });
  });
}

function deleteSet(set_num) {
  return new Promise((resolve, reject) => {
    Set.destroy({ where: { set_num } })
      .then((affectedRows) => {
        if (affectedRows > 0) {
          resolve();
        } else {
          reject('No set found to delete');
        }
      })
      .catch((error) => {
        reject(error.errors && error.errors.length > 0 ? error.errors[0].message : 'An error occurred while deleting the set.');
      });
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };
