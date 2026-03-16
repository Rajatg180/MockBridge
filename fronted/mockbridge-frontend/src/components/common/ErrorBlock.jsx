export default function ErrorBlock({
  title = 'Something went wrong',
  message = 'Please try again.',
  action,
}) {
  return (
    <div className="error-block" role="alert">
      <div>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
