import React from 'react'

const VerificationCodeInput = ({ email, code, setCode }) => {
  return (
    <>
      <p className="text-sm mb-2 text-gray-600">
        Код подтверждения был отправлен на <b>{email}</b>.
      </p>
      <input
          type="text"
          placeholder="Введите проверочный код"
          className="input-box"
          value={code}
          onChange={(e) => setCode(e.target.value)}
      />
    </>
  )
}

export default VerificationCodeInput