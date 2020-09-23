const CronJob = require('cron').CronJob;

console.log('Before job instantiation');
const job = new CronJob('*/5 * * * * *', function() {
	const d = new Date();
	console.log('At five Second:', d);
});
console.log('After job instantiation');
job.start();