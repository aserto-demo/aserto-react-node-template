import React from 'react'
import logo from '../assets/logo.svg'

const Hero = () =>
  <div className="text-center hero my-3">
    <img className="mb-3 app-logo" src={logo} alt="React logo" width="120" />
    <h1 className="mb-4">Aserto React / Node Sample</h1>

    <p className="lead">
      A sample that demonstrates fine-grained authorization for
      a single-page <a href="https://reactjs.org">React</a> application, and a node.js API.
    </p>
  </div>

export default Hero
