@app
remix-website-8e12

@http
/*
  method any
  src server

@static
fingerprint external

@tables
user
  pk *String

password
  pk *String # userId

note
  pk *String  # userId
  sk **String # noteId

doc
  pk *String # ghRef
  sk **String # docId

docRef
  pk *String
  status String
  
