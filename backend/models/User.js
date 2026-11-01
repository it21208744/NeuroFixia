const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please add a name'], trim: true },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: { type: String, required: [true, 'Please add a password'], minlength: 6 },
    child: {
      name: { type: String, trim: true },
      age: Number,
      gender: String,
    },
  },
  { timestamps: true }
)

// Bug fix: the original hook called next() but kept running, re-hashing the password on every save.
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password)
}

userSchema.methods.toPublic = function toPublic() {
  return { _id: this.id, name: this.name, email: this.email, child: this.child || {} }
}

module.exports = mongoose.model('User', userSchema)
