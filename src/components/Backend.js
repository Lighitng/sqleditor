class Backend {

  constructor(_http) {
    const base_url = process.env.API_ROOT || 'localhost:3000'
    this.http = _http
    this.resource = {
      batch_jobs_url: base_url + "/runningjobs",
      stream_jobs_url: base_url + "/stream/jobs/running",
      kill_stream_jobs_url: base_url + "/stream/jobs/kill",
      kill_batch_jobs_url: base_url + "/killjob",
      job_url: base_url + "/run/script",
    }
  }

  submitJob(params,
            submitBefore = () => {},
            submitSuccess = () => {},
            submitFail = (msg) => {},
            mock=false) {
    if (mock) {
      console.log('data is mocked')
      submitBefore()
      submitSuccess()
      return {
        columns: ['col1', 'col2', 'col3'],
        tableData: [
          ['data1_1', 'data1_2', 'data1_3'],
          ['data1_1', 'data1_2', 'data1_3'],
          ['data1_1', 'data1_2', 'data1_3'],
          ['data1_1', 'data1_2', 'data1_3'],
          ['data1_1', 'data1_2', 'data1_3'],
          ['data1_1', 'data1_2', 'data1_3'],
          ['data1_1', 'data1_2', 'data1_3'],
          ['data2_1', 'data2_2', 'data2_3']
        ]
      }
    }

    const columns = [];
    // use keys to get column
    const tableData = []

    const resource = this.resource.job_url
    const options = {
      emulateJSON: true
    }
    const self = this
    submitBefore()
    self.http.post(resource,
      params, options).then(res => {
      submitSuccess()
      let data = res.data
      let keys = []
      let basket = {};

      //collect all keys
      data.forEach(function (item) {
        for (let key in item) {
          if (!basket[key]) {
            keys.push(key)
            basket[key] = true
          }
        }
      })

      columns.push(...keys)

      data.forEach(function (item) {
        let new_item = {}
        keys.forEach(function (key) {
          new_item[key] = item[key]
        })
        tableData.push(new_item)
        console.log(tableData)
      })
    }, res => {
      submitFail(res.bodyText)
    })
    return {"columns": columns, "tableData": tableData}
  }

  killJob(jobType, jobId) {
    const self = this
    const options = {
      emulateJSON: true
    }
    let finalUrl = self.resource.kill_stream_jobs_url

    if (jobType != "stream") {
      finalUrl = self.resource.kill_batch_jobs_url
    }

    const success = []
    self.http.post(finalUrl, {groupId: jobId}, options).then(ok => {
      success.push(true)
    }, notok => {
      success.push(false)
    })
    return success
  }
}

export default Backend
