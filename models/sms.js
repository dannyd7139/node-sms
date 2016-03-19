var db = require('../db.js');
var async = require('async');
var logger = require('winston');

exports.createTask = function(activation, callback) {
    async.waterfall([
        function (callback) {
            var task_values = [
                1
            ];
            db.get().query("INSERT INTO tasks (status) VALUES (?)", task_values, callback);
        },
        function (results, callback) {
            var job_id = results.insertId;
            var activation_values = [
                job_id,
                activation.esn,
                activation.first_name,
                activation.last_name,
                activation.address,
                activation.city,
                activation.state,
                activation.zip,
                activation.dob,
                activation.birth_month,
                activation.birth_day,
                activation.birth_year,
                activation.email,
                activation.pin,
                activation.ip,
                activation.port
            ];
            db.get().query("INSERT INTO activations (job_id, esn, first_name, last_name, address, city, state, zip, dob, birth_month, birth_day, birth_year, email, pin, ip, port) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", activation_values, callback);
        },
    ],function (err, result) {
        callback(err, result);
    });
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

exports.getAllPendingTasks = function(callback) {
    db.get().query("SELECT tasks.id FROM tasks WHERE tasks.status = 1 LIMIT 100", function (err, rows) {
        if (err) {
            logger.error(err);
        }
        callback(rows);
    });
}

exports.getAllAccountTasks = function(callback) {
    db.get().query("SELECT tasks.id FROM tasks WHERE updated_at < DATE_SUB(NOW(), INTERVAL 1 HOUR) AND status = 3", function (err, rows) {
        if (err) {
            logger.error(err);
        }
        callback(rows);
    });
}

exports.getAllActivationsDaily = function(callback) {
    db.get().query("SELECT COUNT(tasks.id) AS count FROM tasks WHERE DATE(updated_at) = CURDATE() AND tasks.status != 1", function (err, row) {
        if (err) {
            logger.error(err);
        }
        callback(row[0].count);
    });
}

exports.getTask = function(id, status, callback) {
    async.waterfall([
        function (cb) {
            var task_values = [
                status, id
            ];
            db.get().query("UPDATE tasks SET status = ? WHERE id = ?", task_values, cb);
        },
        function (result,_,cb) {
            var activation_values = [
                id
            ];
            db.get().query("SELECT job_id, esn, first_name, last_name, address, city, state, zip, MONTH(STR_TO_DATE(birth_month, '%M')) AS birth_month, birth_day, birth_year, email, pin, phone, ip, port FROM activations WHERE activations.job_id = ?", activation_values, cb);
        }
    ], callback);
}

exports.updateTask = function(task, callback) {
    async.waterfall([
        function (cb) {
            var task_values = [
                task.status,
                task.job_id
            ];
            db.get().query("UPDATE tasks SET status = ? WHERE id = ?", task_values, cb);
        },
        function (result,_,cb) {
            var activation_values = [
                task.phone,
                task.account,
                task.job_id
            ];
            db.get().query("UPDATE activations SET phone = ?, account = ? WHERE job_id = ?", activation_values, cb);
        },
    ], callback);
}
