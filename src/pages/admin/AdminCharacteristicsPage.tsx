import {useState, useEffect} from "react";
import '../../styles/AdminCharacteristics.css';
import {useAuth} from "../../auth/AuthContext.tsx";

interface Characteristic{
    id: number;
    nombre: string;
}


export default function AdminCharacteristicsPage() {
    const [characteristics, setCharacteristics] = useState<Characteristic[]>([]); //stores received characteristics

    const [loading, setLoading] = useState(true); //tells if we are waiting a response
    const {authFetch} = useAuth();
    const[error, setError] = useState(''); // stores a message in case of an error
    const [selectedCharacteristic, setSelectedCharacteristic] = useState<Characteristic | null>(null); //this state can store an object type Characteristic or a null
    const [editedName, setEditedName] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [success, setSuccess] = useState('');

    async function loadCharacteristics(){
        setLoading(true);
        setError('');

        try{
            const response = await fetch('http://localhost:8080/api/caracteristicas');
            if(!response.ok){
                setError("No se pudieron cargar las caracteísticas");
                return;
            }

            const data: Characteristic[] = await response.json();

            setCharacteristics(data);

        }catch(error){

            setError(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error inesperado"
            );

        }finally{
            setLoading(false);

        }
    }

    function handleEdit(characteristic: Characteristic){
        setSelectedCharacteristic(characteristic);
        setEditedName(characteristic.nombre);
        setSaveError('');
        setSuccess('');
    }

    function handleCancel(){
        setSelectedCharacteristic(null);
        setEditedName('');
    }

    useEffect(() =>{
        loadCharacteristics();
    },[])

    async function handleSave(){

        if(selectedCharacteristic === null || saving){
            return;
        }
        if(editedName === ''){
            return;
        }
        setSaving(true);
        setSaveError('');
        setSuccess('');
        try{
            const updatedCharacteristic = await authFetch<Characteristic>(
                `/api/admin/caracteristicas/${selectedCharacteristic.id}`,
                {
                    method: 'PUT',
                    body: {
                        nombre: editedName.trim()
                    }
                }
            );

            // Update the table with the characteristic returned by the server.
            setCharacteristics(previousCharacteristics =>
                previousCharacteristics.map(characteristic =>
                    characteristic.id === updatedCharacteristic.id
                        ? updatedCharacteristic
                        : characteristic
                )
            );

            setSelectedCharacteristic(null);
            setEditedName('');
            setSuccess('Característica actualizada correctamente.');
        }catch (error) {
            setSaveError(
                error instanceof Error
                ? error.message
                    : 'Ocurrió un error inesperado'
            );
        }finally{
            setSaving(false);

        }
    }

    return (
        <div className="admin-characteristics">
            <h1>Características</h1>

            <p>Administración de características de avistamientos.</p>

            {loading && <p>Cargando características...</p>}

            {error && <p>{error}</p>}

            {success && (
                <p className="characteristic-success" role="status">
                    {success}
                </p>
            )}

            {!loading && !error && (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>

                    <tbody>
                    {characteristics.map(characteristic => (
                        <tr key={characteristic.id}>
                            <td>{characteristic.id}</td>
                            <td>{characteristic.nombre}</td>
                            <td>
                                <button onClick={() => handleEdit(characteristic)}>Editar</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {!loading && !error && characteristics.length === 0 && (
                <p>No hay características disponibles.</p>
            )}

            {selectedCharacteristic !== null && (
                <div className="characteristic-edit">

                    <h2>Editar característica</h2>

                    <p>ID: {selectedCharacteristic.id}</p>

                    <label htmlFor="characteristic-name">
                        Nombre
                    </label>

                    <input
                        id="characteristic-name"
                        type="text"
                        value={editedName}
                        onChange={(event) => setEditedName(event.target.value)}
                    />

                    {saveError && (
                        <p className="characteristic-error" role="alert">
                            {saveError}
                        </p>
                    )}
                    {success && (
                        <p className="characteristic-success" role="status">
                            {success}
                        </p>
                    )}

                    <button type="button" onClick={handleCancel}>
                        Cancelar
                    </button>

                    <button type="button" onClick={handleSave} disabled={saving || !editedName.trim()}>
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>

                </div>
            )}
        </div>
    )
}