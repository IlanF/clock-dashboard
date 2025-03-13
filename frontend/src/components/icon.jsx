const Icon = ({path, size, ...props}) => <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    style={{
        display: 'inline-block',
        height: 'auto',
        width: (size ? ((size / 4) + 'rem') : '1.5rem')
    }}
    {...props}
>
    <path fill="currentColor" d={path} />
</svg>;

export default Icon